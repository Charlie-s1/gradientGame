type boxProps = {
  col?: String | null;
  selected?: Boolean;
  correct?: Boolean;
  onClick?: any;
  customStyle?: String;
};

const RenderBox = ({
  col,
  selected = false,
  correct = false,
  onClick,
  customStyle = "",
}: boxProps) => {
  return (
    <div
      onClick={onClick}
      className={`w-full h-full p-1 rounded-md 
        ${correct ? "border-0! cursor-default!" : ""}
        ${onClick ? "cursor-pointer " : ""} ${
        selected ? "ring-2 ring-white m-1" : ""
      } ${customStyle}`}
    >
      <div
        style={{
          backgroundColor: col
            ? col.startsWith("#")
              ? (col as string)
              : `#${col}`
            : "transparent",
        }}
        className="w-full h-full rounded"
      />
    </div>
  );
};

export default RenderBox;
