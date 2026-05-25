import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

class FraudAnomalyDetector:
    def __init__(self):
        self.model = None
        self.model_lof = None
        self.preprocessor = None
        self.is_fitted = False
        
        # Calibration boundaries for scores
        self.min_decision_score = 0.0
        self.max_decision_score = 0.0
        
        # Training distribution statistics for explainability
        self.stats = {}

    def fit(self, csv_path):
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Training data not found at {csv_path}")

        # Load dataset
        df = pd.read_csv(csv_path)
        
        # Extract features and targets
        X = df[['amount', 'type', 'category', 'hour', 'day_of_week', 'is_weekend', 'txns_last_24h', 'amount_last_24h']]
        
        # Define preprocessing pipeline
        categorical_features = ['type', 'category']
        numeric_features = ['amount', 'hour', 'day_of_week', 'is_weekend', 'txns_last_24h', 'amount_last_24h']
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
            ]
        )
        
        # Preprocess features
        X_processed = self.preprocessor.fit_transform(X)
        
        # Train Isolation Forest
        self.model = IsolationForest(contamination=0.04, random_state=42)
        self.model.fit(X_processed)
        
        # Train Local Outlier Factor (LOF) for Ensembling
        self.model_lof = LocalOutlierFactor(n_neighbors=20, contamination=0.04, novelty=True)
        self.model_lof.fit(X_processed)
        
        # Compute decision scores for calibration
        decision_scores = self.model.decision_function(X_processed)
        self.min_decision_score = float(np.min(decision_scores))
        self.max_decision_score = float(np.max(decision_scores))
        
        # Calculate statistics for the explainability layer
        self.stats['overall_mean_amount'] = float(df[df['type'] == 'expense']['amount'].mean())
        self.stats['overall_std_amount'] = float(df[df['type'] == 'expense']['amount'].std())
        
        # Category-specific averages for expenses
        cat_stats = {}
        for cat in df['category'].unique():
            cat_expenses = df[(df['category'] == cat) & (df['type'] == 'expense')]['amount']
            if len(cat_expenses) > 0:
                cat_stats[cat] = {
                    'mean': float(cat_expenses.mean()),
                    'std': float(cat_expenses.std()) if len(cat_expenses) > 1 else 1.0
                }
            else:
                cat_stats[cat] = {'mean': 50.0, 'std': 20.0}
        self.stats['category_stats'] = cat_stats
        
        self.is_fitted = True
        print("🌲 IsolationForest anomaly detector trained successfully!")

    def predict(self, txn_data):
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Run fit() first.")
            
        # Parse inputs
        amount = float(txn_data.get('amount', 0))
        type_ = str(txn_data.get('type', 'expense')).lower()
        category = str(txn_data.get('category', 'Other'))
        hour = int(txn_data.get('hour', 12))
        day_of_week = int(txn_data.get('day_of_week', 0))
        is_weekend = int(txn_data.get('is_weekend', 0))
        txns_last_24h = int(txn_data.get('txns_last_24h', 0))
        amount_last_24h = float(txn_data.get('amount_last_24h', 0))
        
        # Create single row DataFrame
        input_df = pd.DataFrame([{
            'amount': amount,
            'type': type_,
            'category': category,
            'hour': hour,
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'txns_last_24h': txns_last_24h,
            'amount_last_24h': amount_last_24h
        }])
        
        # Process and predict
        processed_input = self.preprocessor.transform(input_df)
        
        # Isolation Forest prediction: -1 for anomaly, 1 for normal
        prediction_iso = self.model.predict(processed_input)[0]
        decision_score_iso = self.model.decision_function(processed_input)[0]
        
        # LOF prediction
        prediction_lof = self.model_lof.predict(processed_input)[0]
        decision_score_lof = self.model_lof.decision_function(processed_input)[0]
        
        # Map Isolation Forest decision score to 0.0 - 1.0 fraud probability scale
        calibrated_score_iso = 0.0
        if decision_score_iso < 0:
            val = abs(decision_score_iso) / abs(self.min_decision_score) if self.min_decision_score != 0 else 0
            calibrated_score_iso = 0.5 + (min(val, 1.0) * 0.5)
        else:
            val = decision_score_iso / self.max_decision_score if self.max_decision_score != 0 else 0
            calibrated_score_iso = 0.5 * (1.0 - min(val, 1.0))
            
        # Ensemble: Average the scores or take the max (for stricter security, take max)
        calibrated_score = calibrated_score_iso
        
        # If LOF also flags it, boost the score
        if prediction_lof == -1:
            calibrated_score = min(1.0, calibrated_score + 0.2)
        
        # Ensembled prediction
        prediction = -1 if prediction_iso == -1 or prediction_lof == -1 else 1
            
        # Explainability analysis
        reasons = []
        
        # We only flag expenses for fraud (income transactions like Salary are safe)
        if type_ == 'income':
            is_flagged = False
            calibrated_score = 0.0
        else:
            # Hard threshold override: ensure high amount triggers anomaly flag
            is_flagged = bool(prediction == -1 or calibrated_score >= 0.5)
            
            # Rule 1: High Transaction Value Anomaly
            overall_limit = self.stats['overall_mean_amount'] + (2.5 * self.stats['overall_std_amount'])
            if amount > overall_limit:
                reasons.append(f"Unusually high transaction value (${amount:,.2f}) compared to historical average.")
                
            # Rule 2: Category specific deviation
            cat_info = self.stats['category_stats'].get(category)
            if cat_info:
                cat_mean = cat_info['mean']
                if amount > 3.0 * cat_mean:
                    reasons.append(f"Spending on {category} is {int(amount/cat_mean)}x higher than average (${cat_mean:,.2f}).")
            
            # Rule 3: Late night activity
            if hour >= 1 and hour <= 4:
                reasons.append(f"Late-night transaction executed at {hour:02d}:00 AM (typical spending occurs in daytime).")
                
            # Rule 4: Transfer risk factor
            if category == 'Transfer' and amount > 1000:
                reasons.append(f"High-value money transfer flagged for secondary verification.")

            # Rule 5: Velocity / Card Testing
            if txns_last_24h > 5:
                reasons.append(f"High transaction velocity detected ({txns_last_24h} transactions in 24 hours). Possible card testing.")
                
            # Rule 6: Weekend anomaly
            if is_weekend and category == 'Transfer' and hour >= 0 and hour <= 5:
                reasons.append("Weekend late-night transfer is a strong indicator of account takeover.")

            # Fallback if model flagged it but no specific statistics rule caught it
            if is_flagged and len(reasons) == 0:
                reasons.append("Multi-dimensional anomaly detected (unusual combination of category, type, and transaction time).")
            
        return {
            "isFlagged": is_flagged,
            "fraudScore": round(calibrated_score, 4),
            "flagReasons": reasons
        }

    def save(self, filepath):
        data = {
            'model': self.model,
            'model_lof': self.model_lof,
            'preprocessor': self.preprocessor,
            'stats': self.stats,
            'min_decision_score': self.min_decision_score,
            'max_decision_score': self.max_decision_score
        }
        joblib.dump(data, filepath)
        print(f"💾 Model state successfully saved to {filepath}")

    def load(self, filepath):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Saved model file not found at {filepath}")
        data = joblib.load(filepath)
        self.model = data['model']
        self.model_lof = data.get('model_lof')
        self.preprocessor = data['preprocessor']
        self.stats = data['stats']
        self.min_decision_score = data['min_decision_score']
        self.max_decision_score = data['max_decision_score']
        self.is_fitted = True
        print(f"🔌 Model state loaded from {filepath}")
