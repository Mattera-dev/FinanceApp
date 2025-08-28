import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, User } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  icon: React.ComponentType<any>;
}

const plans: PricingPlan[] = [
  {
    name: "Básico",
    price: "Gratuito",
    period: "p/ sempre",
    description: "Ideal para começar a organizar suas finanças pessoais",
    features: [
      "Controle de gastos básico",
      "Graficos de evolucao mensal",
      "Categorização automática",
      "Integracao ao whatsapp",
      "Suporte por email"
    ],
    buttonText: "Começar Agora",
    icon: User
  },
  {
    name: "Pro",
    price: "R$ 24,90",
    period: "/mês",
    description: "Para quem busca controle completo das finanças",
    features: [
      "Tudo do plano básico",
      "Análises avançadas e insights",
      "Alertas personalizados",
      "Metas com alertas de progresso",
      "Suporte prioritário"
    ],
    buttonText: "Assinar Pro",
    isPopular: true,
    icon: Zap
  },
  {
    name: "Empresarial",
    price: "R$ 64,90",
    period: "/mês",
    description: "Solução completa para pequenas e médias empresas",
    features: [
      "Tudo do plano Pro",
      "Multi-usuários (até 10)",
      "Relatórios empresariais",
      "Dashboard executivo",
      "Consultoria financeira mensal"
    ],
    buttonText: "Falar com Vendas",
    icon: Building2
  }
];

export default function PricingSection() {
  return (
   <section className="py-16 px-4 bg-gradient-to-br from-background via-muted/20 to-blue-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Escolha o Plano Ideal
          </h2>
          <p className="text-lg text-muted-foreground">
            Planos flexíveis para suas necessidades financeiras
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  plan.isPopular 
                    ? 'ring-2 ring-blue-600 shadow-[var(--shadow-popular)] scale-105' 
                    : 'shadow-[var(--shadow-card)] hover:shadow-lg'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1 text-xs font-semibold">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto ${
                    plan.isPopular 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' 
                      : 'bg-slate-100 text-blue-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>
                  
                  <CardDescription className="text-sm text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5`}>
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full h-10 text-sm font-semibold mt-auto"
                    variant={plan.isPopular ? "default" : "secondary"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            7 dias grátis • Cancele a qualquer momento
          </p>
        </div>
      </div>
    </section>
  );
}