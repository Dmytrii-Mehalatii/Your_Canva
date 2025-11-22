import "material-symbols";

export default function IconButton(props: {
  icon: string;
  size?: number;
  color: string;
  thin?: boolean;
  bigBox?: boolean;
  scale?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-center ${props.bigBox ? "w-[78px]" : ""} h-full `}
    >
      <button
        className={`${props.size ? `w-${props.size} h-${props.size}` : "w-12 h-12"} flex items-center justify-center rounded-xl hover:cursor-pointer`}
        onClick={props.onClick}
      >
        <span
          className={`material-symbols-outlined ${props.thin ? "icon-thin" : ""} ${props.scale ? `scale-${props.scale}` : "scale-165"}`}
          style={{ color: props.color, scale: props.scale }}
        >
          {props.icon}
        </span>
      </button>
    </div>
  );
}
