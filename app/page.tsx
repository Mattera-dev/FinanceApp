"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardPreview } from "@/components/dashboard-preview"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import {
  TrendingUp,
  PieChart,
  Shield,
  Smartphone,
  BarChart3,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Play,
  LayoutDashboard,
} from "lucide-react"
import PricingSection from "@/components/plans-section"
import { authStore } from "./stores/authStore"

export default function HomePage() {
  const router = useRouter()
  const { isLogged, login, logout } = authStore()

  const delayClasses = "delay-[150ms] delay-[300ms] delay-[450ms] delay-[600ms] delay-[750ms] delay-[900ms] delay-[1050ms] delay-[1200ms]"

  const demoContainer = useIntersectionObserver({ threshold: 0.01 })
  const ctaContainer = useIntersectionObserver({ threshold: 0.1 })
  const contactContainer = useIntersectionObserver({ threshold: 0.6 })

  const features = [
    {
      icon: PieChart,
      title: "Visualização de Dados",
      description: "Gráficos interativos que mostram a distribuição dos seus gastos por categoria",
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Acompanhe a evolução das suas receitas e despesas ao longo do tempo",
    },
    {
      icon: CreditCard,
      title: "Controle de Transações",
      description: "Registre e organize todas as suas transações financeiras em um só lugar",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados ficam seguros com autenticação e armazenamento local protegido",
    },
    {
      icon: Smartphone,
      title: "Design Responsivo",
      description: "Acesse suas finanças de qualquer dispositivo com interface otimizada",
    },
    {
      icon: TrendingUp,
      title: "Análise Inteligente",
      description: "Insights automáticos sobre seus hábitos financeiros e oportunidades de economia",
    },
  ];

  const cardObservers = features.map(() => useIntersectionObserver({ threshold: 0.6 }))

  const contacts = [
    { icon: Mail, title: "Email", description: "vinimatteraz@gmail.com" },
    { icon: Phone, title: "Telefone", description: "(11) 91789-8932" },
    { icon: MapPin, title: "Endereço", description: "São Paulo, SP - Brasil" },
  ]


  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold text-primary">ZenFinance</h1>
          </div>
          <div className="space-x-2">
            {isLogged ? (
              <Button onClick={() => router.push("/dashboard")} className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Ir para Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/auth")}>
                  Entrar
                </Button>
                <Button onClick={() => router.push("/auth?mode=register")}>Começar Grátis</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - No animation, always visible */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto text-center max-w-4xl relative">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Controle Total das Suas Finanças
          </Badge>
          <h2 className="text-3xl md:text-6xl font-bold mb-6 text-balance">
            Gerencie suas finanças com <span className="text-primary">inteligência</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Uma plataforma completa para controlar receitas, despesas e visualizar seus dados financeiros com gráficos
            interativos e relatórios detalhados.
          </p>
          <div className="space-x-2 flex items-center justify-center">
            {isLogged ? (
              <Button size="lg" onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Acessar Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => router.push("/auth?mode=register")}
                className="bg-primary hover:bg-primary/90"
              >
                Começar Agora
              </Button>
            )}
            <Button size="lg" variant="outline" className="backdrop-blur-sm bg-transparent" onClick={scrollToDemo}>
              <Play className="h-4 w-4 mr-2" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Recursos Principais</h3>
            <p className="text-muted-foreground text-lg">
              Tudo que você precisa para ter controle total das suas finanças
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8`}
          >
            {features.map((feature, index) => {

              const { ref, isIntersecting } = cardObservers[index]

              return (
                <Card
                  key={index}
                  ref={ref}
                  className={`
                  bg-card/80 backdrop-blur-sm border-primary/10
                  hover:border-primary/20 transition-all duration-200 ease-in-out
                  ${isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                  delay-[${(index + 1) * 150}ms]
                  `}
                >
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold mb-4">Veja Como Funciona</h3>
            <p className="text-muted-foreground text-lg">
              Uma prévia da sua dashboard financeira com dados em tempo real
            </p>
          </div>

          <div
            ref={demoContainer.ref}
            className={`relative transition-all duration-200 ease-out ${demoContainer.isIntersecting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl" />
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10 p-8">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div
          ref={ctaContainer.ref}
          className={`container mx-auto text-center max-w-5xl relative transition-all duration-700 ease-out ${ctaContainer.isIntersecting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
        >
          <h3 className="text-3xl font-bold mb-4">Pronto para transformar suas finanças?</h3>
          <p className="text-muted-foreground text-lg mb-8">
            Junte-se a milhares de usuários que já estão no controle das suas finanças pessoais
          </p>
          {isLogged ? (
            <Button size="lg" onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Acessar Dashboard
            </Button>
          ) : (
            <PricingSection />
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Entre em Contato</h3>
            <p className="text-muted-foreground text-lg">Tem dúvidas? Nossa equipe está aqui para ajudar</p>
          </div>

          <div
            ref={contactContainer.ref}
            className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ease-out ${contactContainer.isIntersecting
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
              }`}
          >
            {
              contacts.map((contact, index) => (
                <Card
                  key={index}
                  className={`bg-card/80 backdrop-blur-sm border-primary/10 transition-all duration-300 hover:border-primary/20`}
                >
                  <CardHeader className="text-center">
                    <contact.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>{contact.title}</CardTitle>
                    <CardDescription>{contact.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">ZenFinance</span>
          </div>
          <p className="text-muted-foreground">© 2025 ZenFinance. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
