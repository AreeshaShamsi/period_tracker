import React from "react";
import { Href, Redirect } from "expo-router";

export default function DashboardRoute() {
  return <Redirect href={"/(app)/(tabs)/" as Href} />;
}
