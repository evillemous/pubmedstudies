import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import statsmodels.api as sm
from typing import List, Dict, Any, Optional, Tuple
import os
import io
import base64
from matplotlib.figure import Figure
from datetime import datetime

class MetaAnalysis:
    """
    A class for performing meta-analysis on medical research data.
    """
    
    def __init__(self, studies: List[Dict[str, Any]]):
        """
        Initialize the meta-analysis with a list of study data.
        
        Args:
            studies: List of dictionaries containing study data
        """
        self.studies = studies
        self.df = self._create_dataframe()
        self.results = {}
        self.figures = {}
        
    def _create_dataframe(self) -> pd.DataFrame:
        """
        Convert the list of studies to a pandas DataFrame.
        
        Returns:
            pd.DataFrame: DataFrame containing study data
        """
        df = pd.DataFrame(self.studies)
        
        numeric_cols = ['n_total', 'n_treatment', 'n_control', 'effect_size', 'ci_lower', 'ci_upper', 'p_value']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
        return df
        
    def perform_meta_analysis(self, method: str = 'random') -> Dict[str, Any]:
        """
        Perform meta-analysis on the study data.
        
        Args:
            method: Method for meta-analysis ('random' or 'fixed')
            
        Returns:
            Dict: Results of the meta-analysis
        """
        if len(self.df) < 2:
            raise ValueError("Meta-analysis requires at least 2 studies")
            
        required_cols = ['study_name', 'effect_size', 'ci_lower', 'ci_upper']
        for col in required_cols:
            if col not in self.df.columns:
                raise ValueError(f"Missing required column: {col}")
                
        df = self.df.dropna(subset=['effect_size', 'ci_lower', 'ci_upper'])
        
        if len(df) < 2:
            raise ValueError("Not enough studies with complete effect size data")
            
        df['se'] = (df['ci_upper'] - df['ci_lower']) / (2 * 1.96)
        
        df['weight_fixed'] = 1 / (df['se'] ** 2)
        
        weighted_sum = (df['effect_size'] * df['weight_fixed']).sum()
        sum_of_weights = df['weight_fixed'].sum()
        fixed_effect = weighted_sum / sum_of_weights
        
        Q = ((df['weight_fixed'] * ((df['effect_size'] - fixed_effect) ** 2))).sum()
        df_value = len(df) - 1
        p_heterogeneity = 1 - stats.chi2.cdf(Q, df_value)
        I_squared = max(0, 100 * (Q - df_value) / Q) if Q > 0 else 0
        
        if method == 'random' or p_heterogeneity < 0.1:
            tau_squared = max(0, (Q - df_value) / (sum_of_weights - (df['weight_fixed'] ** 2).sum() / sum_of_weights))
            
            df['weight_random'] = 1 / (df['se'] ** 2 + tau_squared)
            
            weighted_sum_random = (df['effect_size'] * df['weight_random']).sum()
            sum_of_weights_random = df['weight_random'].sum()
            random_effect = weighted_sum_random / sum_of_weights_random
            
            se_random = np.sqrt(1 / sum_of_weights_random)
            ci_lower_random = random_effect - 1.96 * se_random
            ci_upper_random = random_effect + 1.96 * se_random
            
            effect_model = {
                'method': 'random',
                'effect_size': random_effect,
                'ci_lower': ci_lower_random,
                'ci_upper': ci_upper_random,
                'se': se_random,
                'p_value': 2 * (1 - stats.norm.cdf(abs(random_effect / se_random)))
            }
        else:
            se_fixed = np.sqrt(1 / sum_of_weights)
            ci_lower_fixed = fixed_effect - 1.96 * se_fixed
            ci_upper_fixed = fixed_effect + 1.96 * se_fixed
            
            effect_model = {
                'method': 'fixed',
                'effect_size': fixed_effect,
                'ci_lower': ci_lower_fixed,
                'ci_upper': ci_upper_fixed,
                'se': se_fixed,
                'p_value': 2 * (1 - stats.norm.cdf(abs(fixed_effect / se_fixed)))
            }
            
        self.results = {
            'studies': df.to_dict('records'),
            'effect_model': effect_model,
            'heterogeneity': {
                'Q': Q,
                'df': df_value,
                'p_value': p_heterogeneity,
                'I_squared': I_squared
            },
            'summary': {
                'n_studies': len(df),
                'total_participants': df['n_total'].sum() if 'n_total' in df.columns else None,
                'effect_type': df['effect_type'].iloc[0] if 'effect_type' in df.columns else None,
                'outcome_measure': df['outcome_measure'].iloc[0] if 'outcome_measure' in df.columns else None
            }
        }
        
        return self.results
        
    def create_forest_plot(self, title: str = "Forest Plot", figsize: Tuple[int, int] = (10, 8)) -> str:
        """
        Create a forest plot of the meta-analysis results.
        
        Args:
            title: Title of the plot
            figsize: Size of the figure (width, height)
            
        Returns:
            str: Base64-encoded PNG image of the forest plot
        """
        if not self.results:
            raise ValueError("Perform meta-analysis first")
            
        fig, ax = plt.subplots(figsize=figsize)
        
        df = pd.DataFrame(self.results['studies'])
        effect_model = self.results['effect_model']
        
        df = df.sort_values('effect_size')
        
        y_pos = np.arange(len(df) + 1)  # +1 for the summary effect
        
        for i, (_, row) in enumerate(df.iterrows()):
            ax.plot([row['ci_lower'], row['ci_upper']], [y_pos[i], y_pos[i]], 'b-', alpha=0.6)
            ax.plot(row['effect_size'], y_pos[i], 'bs', ms=8)
            
        ax.plot([effect_model['ci_lower'], effect_model['ci_upper']], [y_pos[-1], y_pos[-1]], 'r-', linewidth=2)
        ax.plot(effect_model['effect_size'], y_pos[-1], 'rs', ms=10)
        
        if df['effect_type'].iloc[0].lower() in ['odds ratio', 'risk ratio', 'hazard ratio']:
            no_effect = 1.0
        else:
            no_effect = 0.0
        ax.axvline(x=no_effect, color='gray', linestyle='--')
        
        ax.set_yticks(y_pos)
        study_labels = list(df['study_name']) + ['Summary']
        ax.set_yticklabels(study_labels)
        
        ax.set_title(title)
        ax.set_xlabel(f"{df['effect_type'].iloc[0]} (95% CI)")
        
        for i, (_, row) in enumerate(df.iterrows()):
            ax.text(
                max(df['ci_upper']) * 1.1, 
                y_pos[i], 
                f"{row['effect_size']:.2f} ({row['ci_lower']:.2f}-{row['ci_upper']:.2f})"
            )
            
        ax.text(
            max(df['ci_upper']) * 1.1, 
            y_pos[-1], 
            f"{effect_model['effect_size']:.2f} ({effect_model['ci_lower']:.2f}-{effect_model['ci_upper']:.2f})"
        )
        
        heterogeneity = self.results['heterogeneity']
        plt.figtext(
            0.1, 
            0.01, 
            f"Heterogeneity: I² = {heterogeneity['I_squared']:.1f}%, "
            f"Q = {heterogeneity['Q']:.2f} (p = {heterogeneity['p_value']:.3f})"
        )
        
        plt.tight_layout()
        plt.subplots_adjust(bottom=0.15, right=0.7)
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=300)
        buf.seek(0)
        
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        
        plt.close(fig)
        
        self.figures['forest_plot'] = img_str
        
        return img_str
        
    def create_funnel_plot(self, title: str = "Funnel Plot", figsize: Tuple[int, int] = (8, 8)) -> str:
        """
        Create a funnel plot to assess publication bias.
        
        Args:
            title: Title of the plot
            figsize: Size of the figure (width, height)
            
        Returns:
            str: Base64-encoded PNG image of the funnel plot
        """
        if not self.results:
            raise ValueError("Perform meta-analysis first")
            
        fig, ax = plt.subplots(figsize=figsize)
        
        df = pd.DataFrame(self.results['studies'])
        effect_model = self.results['effect_model']
        
        ax.scatter(df['effect_size'], df['se'], s=100, alpha=0.7)
        
        ax.axvline(x=effect_model['effect_size'], color='red', linestyle='-', alpha=0.7)
        
        se_min = df['se'].min()
        se_max = df['se'].max() * 1.2
        x_min = effect_model['effect_size'] - 4 * se_max
        x_max = effect_model['effect_size'] + 4 * se_max
        
        se_range = np.linspace(se_min, se_max, 100)
        lower_bound = effect_model['effect_size'] - 1.96 * se_range
        upper_bound = effect_model['effect_size'] + 1.96 * se_range
        
        ax.plot(lower_bound, se_range, 'k--', alpha=0.4)
        ax.plot(upper_bound, se_range, 'k--', alpha=0.4)
        
        ax.invert_yaxis()
        
        ax.set_xlabel(df['effect_type'].iloc[0])
        ax.set_ylabel('Standard Error')
        ax.set_title(title)
        
        X = sm.add_constant(df['effect_size'])
        y = df['effect_size'] / df['se']
        model = sm.OLS(y, X).fit()
        p_value = model.pvalues[1]
        
        bias_text = f"Publication bias assessment: p = {p_value:.3f}"
        if p_value < 0.05:
            bias_text += " (significant asymmetry detected)"
        else:
            bias_text += " (no significant asymmetry detected)"
            
        plt.figtext(0.1, 0.01, bias_text)
        
        plt.tight_layout()
        plt.subplots_adjust(bottom=0.15)
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=300)
        buf.seek(0)
        
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        
        plt.close(fig)
        
        self.figures['funnel_plot'] = img_str
        
        return img_str
        
    def save_plots(self, output_dir: str) -> Dict[str, str]:
        """
        Save forest and funnel plots to files.
        
        Args:
            output_dir: Directory to save the plots
            
        Returns:
            Dict: Paths to the saved plot files
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        plot_paths = {}
        
        if 'forest_plot' in self.figures:
            forest_path = os.path.join(output_dir, f"forest_plot_{timestamp}.png")
            with open(forest_path, 'wb') as f:
                f.write(base64.b64decode(self.figures['forest_plot']))
            plot_paths['forest_plot'] = forest_path
            
        if 'funnel_plot' in self.figures:
            funnel_path = os.path.join(output_dir, f"funnel_plot_{timestamp}.png")
            with open(funnel_path, 'wb') as f:
                f.write(base64.b64decode(self.figures['funnel_plot']))
            plot_paths['funnel_plot'] = funnel_path
            
        return plot_paths
        
    def generate_summary_text(self) -> str:
        """
        Generate a formatted text summary of the meta-analysis results.
        
        Returns:
            str: Formatted summary text
        """
        if not self.results:
            raise ValueError("Perform meta-analysis first")
            
        summary = self.results['summary']
        effect_model = self.results['effect_model']
        heterogeneity = self.results['heterogeneity']
        
        text = "## Meta-Analysis Results\n\n"
        
        text += f"**Analysis Type:** {effect_model['method'].capitalize()}-effects meta-analysis\n"
        text += f"**Number of Studies:** {summary['n_studies']}\n"
        
        if summary['total_participants']:
            text += f"**Total Participants:** {summary['total_participants']}\n"
            
        text += f"**Effect Type:** {summary['effect_type']}\n"
        text += f"**Outcome Measure:** {summary['outcome_measure']}\n\n"
        
        text += "### Effect Size\n\n"
        text += f"**Pooled {summary['effect_type']}:** {effect_model['effect_size']:.2f} "
        text += f"(95% CI: {effect_model['ci_lower']:.2f} to {effect_model['ci_upper']:.2f})\n"
        text += f"**P-value:** {effect_model['p_value']:.4f}\n\n"
        
        if summary['effect_type'].lower() in ['odds ratio', 'risk ratio', 'hazard ratio']:
            if effect_model['effect_size'] > 1 and effect_model['ci_lower'] > 1:
                text += "**Interpretation:** The intervention is associated with a statistically significant increase in the outcome.\n\n"
            elif effect_model['effect_size'] < 1 and effect_model['ci_upper'] < 1:
                text += "**Interpretation:** The intervention is associated with a statistically significant decrease in the outcome.\n\n"
            else:
                text += "**Interpretation:** The effect is not statistically significant.\n\n"
        else:  # Mean difference or standardized mean difference
            if effect_model['effect_size'] > 0 and effect_model['ci_lower'] > 0:
                text += "**Interpretation:** The intervention is associated with a statistically significant increase in the outcome.\n\n"
            elif effect_model['effect_size'] < 0 and effect_model['ci_upper'] < 0:
                text += "**Interpretation:** The intervention is associated with a statistically significant decrease in the outcome.\n\n"
            else:
                text += "**Interpretation:** The effect is not statistically significant.\n\n"
                
        text += "### Heterogeneity\n\n"
        text += f"**I²:** {heterogeneity['I_squared']:.1f}%\n"
        text += f"**Q Statistic:** {heterogeneity['Q']:.2f} (df = {heterogeneity['df']})\n"
        text += f"**P-value for Heterogeneity:** {heterogeneity['p_value']:.4f}\n\n"
        
        if heterogeneity['I_squared'] < 25:
            text += "**Interpretation:** Low heterogeneity among studies.\n\n"
        elif heterogeneity['I_squared'] < 50:
            text += "**Interpretation:** Moderate heterogeneity among studies.\n\n"
        else:
            text += "**Interpretation:** High heterogeneity among studies.\n\n"
            
        return text
