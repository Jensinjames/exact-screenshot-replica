import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PricingAnalyticsInput {
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
  revenueByType: Array<{ customerType: string; revenue: number; orderCount: number }>;
  revenueByProduct: Array<{ size: string; variety: string; revenue: number; quantity: number }>;
  blendedPrices: Array<{
    size: string;
    variety: string;
    retailPrice: number;
    wholesalePrice: number;
    retailQuantity: number;
    wholesaleQuantity: number;
    blendedPrice: number;
    totalRevenue: number;
  }>;
  opportunityCosts: Array<{
    size: string;
    variety: string;
    currentBlendedPrice: number;
    benchmarkPrice: number;
    priceDifference: number;
    totalQuantity: number;
    opportunityCost: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log('Authenticated user:', userId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { analyticsData, dateRangeStart, dateRangeEnd } = await req.json() as { 
      analyticsData: PricingAnalyticsInput;
      dateRangeStart?: string;
      dateRangeEnd?: string;
    };

    if (!analyticsData) {
      return new Response(
        JSON.stringify({ error: 'Analytics data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aov = analyticsData.totalOrders > 0 
      ? (analyticsData.totalRevenue / analyticsData.totalOrders).toFixed(2) 
      : '0.00';

    const revenueByTypeText = analyticsData.revenueByType
      .map(r => {
        const percentage = analyticsData.totalRevenue > 0 
          ? ((r.revenue / analyticsData.totalRevenue) * 100).toFixed(1) 
          : '0';
        return `- ${r.customerType}: $${r.revenue.toFixed(2)} (${percentage}% of revenue, ${r.orderCount} orders)`;
      })
      .join('\n');

    const productPerformanceText = analyticsData.revenueByProduct
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p, i) => `${i + 1}. ${p.size} ${p.variety}: $${p.revenue.toFixed(2)} (${p.quantity} units)`)
      .join('\n');

    const blendedPricesText = analyticsData.blendedPrices
      .map(p => `- ${p.size} ${p.variety}: Blended $${p.blendedPrice.toFixed(2)} (Retail: $${p.retailPrice.toFixed(2)} x ${p.retailQuantity}, Wholesale: $${p.wholesalePrice.toFixed(2)} x ${p.wholesaleQuantity})`)
      .join('\n');

    const opportunityCostText = analyticsData.opportunityCosts
      .filter(o => Math.abs(o.opportunityCost) > 0)
      .sort((a, b) => Math.abs(b.opportunityCost) - Math.abs(a.opportunityCost))
      .slice(0, 5)
      .map(o => {
        const status = o.opportunityCost > 0 ? 'underpriced' : 'overpriced';
        return `- ${o.size} ${o.variety}: ${status} by $${Math.abs(o.priceDifference).toFixed(2)}/unit, potential impact: $${Math.abs(o.opportunityCost).toFixed(2)}`;
      })
      .join('\n');

    const prompt = `You are a pricing analyst for a King Cake bakery business. Analyze the following sales data and provide actionable pricing recommendations.

## Current Performance
- Total Revenue: $${analyticsData.totalRevenue.toFixed(2)}
- Total Orders: ${analyticsData.totalOrders}
- Units Sold: ${analyticsData.totalQuantity}
- Average Order Value: $${aov}

## Revenue by Customer Type
${revenueByTypeText || 'No data available'}

## Top Product Performance (by Revenue)
${productPerformanceText || 'No data available'}

## Blended Pricing Analysis
${blendedPricesText || 'No data available'}

## Opportunity Cost Analysis (vs Benchmarks)
${opportunityCostText || 'All products are priced at or above benchmarks'}

Analyze this data and provide strategic pricing insights.`;

    console.log('Calling Lovable AI Gateway for pricing insights...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a pricing strategy expert for a bakery business. Provide clear, actionable insights based on sales data. Be specific with numbers and percentages when making recommendations.'
          },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_pricing_insights',
              description: 'Provide structured pricing insights and recommendations based on sales data analysis',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A 2-3 sentence summary of overall pricing health and performance'
                  },
                  keyObservations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '3-5 key observations about pricing patterns and trends'
                  },
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Short title for the recommendation' },
                        description: { type: 'string', description: 'Detailed explanation of the recommendation' },
                        impact: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Expected impact level' },
                        action: { type: 'string', description: 'Specific action to take' }
                      },
                      required: ['title', 'description', 'impact', 'action']
                    },
                    description: '2-4 specific, actionable pricing recommendations'
                  },
                  riskFactors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '2-3 potential risks or considerations to keep in mind'
                  },
                  potentialRevenue: {
                    type: 'string',
                    description: 'Estimated potential revenue impact if recommendations are implemented'
                  }
                },
                required: ['summary', 'keyObservations', 'recommendations', 'riskFactors', 'potentialRevenue']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_pricing_insights' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received:', JSON.stringify(aiResponse).slice(0, 500));

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const insights = JSON.parse(toolCall.function.arguments);

    // Save insights to history
    const averageOrderValue = analyticsData.totalOrders > 0 
      ? analyticsData.totalRevenue / analyticsData.totalOrders 
      : 0;

    const { error: insertError } = await supabase
      .from('pricing_insights_history')
      .insert({
        created_by: userId,
        date_range_start: dateRangeStart || null,
        date_range_end: dateRangeEnd || null,
        analytics_summary: {
          totalRevenue: analyticsData.totalRevenue,
          totalOrders: analyticsData.totalOrders,
          totalQuantity: analyticsData.totalQuantity,
          averageOrderValue: averageOrderValue,
        },
        insights: insights,
      });

    if (insertError) {
      console.error('Failed to save insights to history:', insertError);
      // Don't fail the request, just log the error
    } else {
      console.log('Insights saved to history successfully');
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in pricing-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
