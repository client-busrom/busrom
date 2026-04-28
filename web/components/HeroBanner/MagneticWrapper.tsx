"use client";

import React from "react";
import Magnetic from "@/components/common/Magnetic";

interface Props {
  children: React.ReactElement;
  strength?: number;
}

export default function MagneticWrapper({ children, strength = 0.5 }: Props) {
  return <Magnetic strength={strength}>{children}</Magnetic>;
}
