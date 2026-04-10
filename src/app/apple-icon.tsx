import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #fffdf8 0%, #ffefd9 100%)",
          borderRadius: 44,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: 36,
            border: "6px solid #f3d4a5",
          }}
        />
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "linear-gradient(180deg, #ffe49a 0%, #f1b95e 100%)",
            position: "absolute",
            top: 42,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 26,
            width: 8,
            height: 22,
            borderRadius: 999,
            background: "#e2a647",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            gap: 0,
            bottom: 34,
          }}
        >
          <div
            style={{
              width: 112,
              height: 56,
              borderTopLeftRadius: 90,
              borderTopRightRadius: 90,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: "12px solid #d58d3a",
              borderBottom: "none",
              transform: "translateX(18px)",
            }}
          />
          <div
            style={{
              width: 124,
              height: 66,
              borderTopLeftRadius: 100,
              borderTopRightRadius: 100,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: "12px solid #f6c979",
              borderBottom: "none",
              transform: "translateX(-18px)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
