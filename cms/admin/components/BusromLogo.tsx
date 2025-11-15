/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@keystone-ui/core";

export function BusromLogo() {
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        margin: "0 auto"
      }}
    >
      {/* Busrom Logo */}
      <img
        src="/Busrom.svg"
        alt="Busrom Logo"
        css={{
          height: "50px",
          width: "auto",
        }}
      />
    </div>
  );
}
