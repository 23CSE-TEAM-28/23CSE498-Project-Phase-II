import torch
import torch.nn as nn
import torch.nn.functional as F

class PersonalizedAttentionLSTM(nn.Module):
    """
    Proposed FPDAF model architecture.
    Combines a base LSTM feature extractor (shared backbone) with a 
    Temporal Attention mechanism and a personalized classification head.
    """
    def __init__(
        self, 
        input_dim: int = 40, 
        hidden_dim: int = 64, 
        num_layers: int = 2, 
        dropout: float = 0.3,
        output_dim: int = 1
    ):
        super(PersonalizedAttentionLSTM, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # LSTM layer (Shared Backbone parameter weights)
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        # Temporal Attention projection layer (Shared or Personalized based on config)
        self.attention_query = nn.Linear(hidden_dim, 1, bias=False)
        
        # Fully Connected Classification Head (Personalized head weights)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, output_dim)
        )
        
    def forward(self, x: torch.Tensor, return_attention: bool = False):
        """
        Forward pass.
        
        Args:
            x (torch.Tensor): Feature tensor of shape (batch_size, sequence_length, input_dim)
            return_attention (bool): If True, returns logits alongside attention weights.
            
        Returns:
            torch.Tensor: Logits of shape (batch_size, output_dim)
            Optional[torch.Tensor]: Attention weights of shape (batch_size, sequence_length, 1)
        """
        # lstm_out shape: (batch_size, sequence_length, hidden_dim)
        lstm_out, _ = self.lstm(x)
        
        # Compute raw attention scores over time steps
        # attn_logits shape: (batch_size, sequence_length, 1)
        attn_logits = self.attention_query(lstm_out)
        
        # Normalize weights via softmax across sequence_length dimension
        # attn_weights shape: (batch_size, sequence_length, 1)
        attn_weights = F.softmax(attn_logits, dim=1)
        
        # Context vector computation: weighted sum of hidden states
        # context shape: (batch_size, hidden_dim)
        context = torch.sum(lstm_out * attn_weights, dim=1)
        
        # Pass context vector through classification head
        logits = self.classifier(context)
        
        if return_attention:
            return logits, attn_weights
        return logits
