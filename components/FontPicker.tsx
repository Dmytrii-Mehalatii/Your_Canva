import { useFont } from "@/lib/utils/useFontContext";

export default function FontPicker(props: {
  bottom?: number;
  translate?: string;
  marginBottom?: number;
  width: number | null;
}) {
  const font = useFont();

  return (
    <div>
      <div
        className=" absolute flex flex-col items-center justify-center gap-4 text-xl bg-white h-[196px] w-[160px] rounded-2xl shadow-[0_2px_4px_0_rgba(255,192,196,1)] px-4 "
        style={{
          bottom: `${props.bottom}px`,
          translate: `${props.translate}%`,
          marginBottom: `${props.marginBottom}px`,
          zIndex: "101",
        }}
      >
        <p
          className="cursor-pointer font-normal"
          onClick={() => font.setFont("Times New Roman")}
        >
          Abcdefgh
        </p>
        <p
          className="cursor-pointer font-judson"
          onClick={() => font.setFont("Judson")}
        >
          Abcdefgh
        </p>
        <p
          className="cursor-pointer font-chilanka"
          onClick={() => font.setFont("Chilanka")}
        >
          Abcdefgh
        </p>
        <p
          className="cursor-pointer font-crafty"
          onClick={() => font.setFont("Crafty Girls")}
        >
          Abcdefgh
        </p>
      </div>
    </div>
  );
}
