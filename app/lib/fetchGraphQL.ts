export interface FetchGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  lang?: string
): Promise<FetchGraphQLResponse<T>> {
  const language =
    lang ||
    (typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en");

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return response.json();
}