"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { makeClient } from "@/lib/apollo-client";

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();
  const client = useMemo(() => makeClient(() => getToken()), [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
