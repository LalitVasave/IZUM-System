import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
import joblib
import os

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    
    dist = np.random.uniform(100, 5000, n_samples)  # meters
    speed = np.random.uniform(5, 40, n_samples)     # km/h
    traffic = np.random.randint(0, 3, n_samples)   # 0: Low, 1: Med, 2: High
    signal = np.random.randint(0, 4, n_samples)    # 0: Full, 1: Red, 2: Min, 3: Dead
    
    # Simple formula for "real" ETA (base time + traffic penalty + signal delay)
    # speed_m_s = speed / 3.6
    # base_eta = dist / speed_m_s
    eta = (dist / (speed / 3.6)) * (1 + 0.5 * traffic) * (1 + 0.2 * signal)
    
    # Add some noise
    eta += np.random.normal(0, eta * 0.1)
    
    df = pd.DataFrame({
        'dist': dist,
        'speed': speed,
        'traffic': traffic,
        'signal': signal,
        'eta': eta
    })
    return df

def train_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data(5000)
    
    X = df[['dist', 'speed', 'traffic', 'signal']]
    y = df['eta']
    
    print("Training GradientBoostingRegressor...")
    model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model.fit(X, y)
    
    score = model.score(X, y)
    print(f"Model trained with R^2 score: {score:.4f}")
    
    joblib.dump(model, 'eta_model.joblib')
    print("Model saved to eta_model.joblib")

if __name__ == "__main__":
    train_model()
