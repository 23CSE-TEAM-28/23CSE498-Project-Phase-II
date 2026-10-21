import torch
import torch.nn as nn

class CentralizedLSTM(nn.Module):
    """
    Standard Centralized LSTM Model for Multivariate Time-Series Sepsis Prediction.
    Takes input of shape (batch_size, sequence_length, input_dim) and outputs classification logits.
    """
    def __init__(
        self, 
        input_dim: int = 40, 
        hidden_dim: int = 64, 
        num_layers: int = 2, 
        dropout: float = 0.3,
        output_dim: int = 1
    ):
        super(CentralizedLSTM, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # LSTM Layer
        # batch_first=True tells the LSTM that input shape is (batch, seq, feature)
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        # Fully Connected layers (Classification Head)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, output_dim)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        
        Args:
            x (torch.Tensor): Feature tensor of shape (batch_size, sequence_length, input_dim)
            
        Returns:
            torch.Tensor: Logits of shape (batch_size, output_dim)
        """
        # lstm_out shape: (batch_size, sequence_length, hidden_dim)
        # hn shape: (num_layers, batch_size, hidden_dim)
        # cn shape: (num_layers, batch_size, hidden_dim)
        lstm_out, (hn, cn) = self.lstm(x)
        
        # Extract the representation of the last time step
        # output[:, -1, :] shape: (batch_size, hidden_dim)
        last_time_step_out = lstm_out[:, -1, :]
        
        # Pass through the classification head
        logits = self.classifier(last_time_step_out)
        
        return logits
