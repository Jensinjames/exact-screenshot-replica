import { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePricingInsights, type PricingInsights } from '@/hooks/pricing/usePricingInsights';
import type { PricingAnalytics } from '@/hooks/pricing';

interface AIPricingInsightsCardProps {
  analyticsData: PricingAnalytics | undefined;
  isLoading: boolean;
}

export function AIPricingInsightsCard({ analyticsData, isLoading }: AIPricingInsightsCardProps) {
  const [insights, setInsights] = useState<PricingInsights | null>(null);
  const [copied, setCopied] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({
    observations: true,
    recommendations: true,
    risks: true,
  });

  const { mutate: generateInsights, isPending } = usePricingInsights();

  const handleGenerateInsights = () => {
    if (!analyticsData) return;
    
    generateInsights(analyticsData, {
      onSuccess: (data) => {
        setInsights(data);
      },
    });
  };

  const handleCopy = async () => {
    if (!insights) return;
    
    const text = `
AI Pricing Insights

Summary:
${insights.summary}

Key Observations:
${insights.keyObservations.map(o => `• ${o}`).join('\n')}

Recommendations:
${insights.recommendations.map(r => `[${r.impact.toUpperCase()}] ${r.title}\n${r.description}\nAction: ${r.action}`).join('\n\n')}

Risk Factors:
${insights.riskFactors.map(r => `• ${r}`).join('\n')}

Potential Revenue Impact: ${insights.potentialRevenue}
    `.trim();

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canGenerate = !isLoading && analyticsData && analyticsData.totalOrders > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Pricing Insights
        </CardTitle>
        <div className="flex items-center gap-2">
          {insights && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleGenerateInsights}
            disabled={!canGenerate || isPending}
            size="sm"
          >
            {isPending ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {insights ? 'Regenerate' : 'Generate Insights'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !isPending && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Sparkles className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">
              {!canGenerate
                ? 'No sales data available to analyze. Try adjusting the date range.'
                : 'Click "Generate Insights" to get AI-powered pricing recommendations based on your sales data.'}
            </p>
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Analyzing your pricing data...
            </p>
          </div>
        )}

        {insights && !isPending && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Summary
              </div>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
              {insights.potentialRevenue && (
                <p className="mt-2 text-sm font-medium text-primary">
                  Potential Impact: {insights.potentialRevenue}
                </p>
              )}
            </div>

            {/* Key Observations */}
            <Collapsible open={sectionsOpen.observations}>
              <CollapsibleTrigger
                onClick={() => toggleSection('observations')}
                className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Key Observations ({insights.keyObservations.length})
                </span>
                {sectionsOpen.observations ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-2">
                  {insights.keyObservations.map((observation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {observation}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Recommendations */}
            <Collapsible open={sectionsOpen.recommendations}>
              <CollapsibleTrigger
                onClick={() => toggleSection('recommendations')}
                className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations ({insights.recommendations.length})
                </span>
                {sectionsOpen.recommendations ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant={getImpactBadgeVariant(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Action:</span> {rec.action}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Risk Factors */}
            <Collapsible open={sectionsOpen.risks}>
              <CollapsibleTrigger
                onClick={() => toggleSection('risks')}
                className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors ({insights.riskFactors.length})
                </span>
                {sectionsOpen.risks ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-2">
                  {insights.riskFactors.map((risk, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
