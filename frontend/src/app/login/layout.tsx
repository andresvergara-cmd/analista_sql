import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Universidad Icesi",
  description: "Accede a la plataforma de diagnóstico de madurez digital",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
