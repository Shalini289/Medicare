"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";

export default function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = url.startsWith("/api/")
      ? api(url)
      : fetch(url).then((res) => res.json());

    load
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}
