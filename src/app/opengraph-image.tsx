import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "hinata social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function HinataCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "linear-gradient(180deg, #fffdf8 0%, #fff6e8 48%, #ffedd4 100%)",
        color: "#4b382d",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -100,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "rgba(255, 218, 143, 0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 58,
          right: 72,
          bottom: 58,
          borderRadius: 40,
          border: "2px solid #f1d7ae",
          background: "rgba(255, 253, 248, 0.72)",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "84px 92px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 660,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: "#8f725b",
              marginBottom: 26,
            }}
          >
            Warm Diary
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            hinata
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.6,
              color: "#725a4a",
            }}
          >
            A warm, local-first
            <br />
            diary for everyday moments
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 290,
            height: 290,
            borderRadius: 56,
            background: "linear-gradient(180deg, #fffaf2 0%, #ffe9c8 100%)",
            border: "2px solid #f2d6ab",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 50px rgba(166, 117, 53, 0.14)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 64,
              width: 92,
              height: 92,
              borderRadius: 999,
              background: "linear-gradient(180deg, #ffe49a 0%, #f1b95e 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 38,
              width: 10,
              height: 28,
              borderRadius: 999,
              background: "#e2a647",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 64,
              left: 52,
              width: 28,
              height: 10,
              borderRadius: 999,
              background: "#e2a647",
              transform: "rotate(-35deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 52,
              width: 28,
              height: 10,
              borderRadius: 999,
              background: "#e2a647",
              transform: "rotate(35deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 54,
              width: 198,
              height: 98,
              borderTopLeftRadius: 180,
              borderTopRightRadius: 180,
              border: "18px solid #d58d3a",
              borderBottom: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 56,
              width: 164,
              height: 76,
              borderTopLeftRadius: 150,
              borderTopRightRadius: 150,
              border: "16px solid #f6c979",
              borderBottom: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(<HinataCard />, size);
}
