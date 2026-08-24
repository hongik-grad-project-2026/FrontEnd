import { InputIconButton } from "./IconButton";
import InputBar from "./Input";

function SearchBar({
  ariaLabel = "검색어",
  className = "",
  name = "inputText",
  onChange,
  onSubmit,
  placeholder = "",
  value,
  width = 360,
  ...inputProps
}) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const inputText = String(formData.get(name) ?? "");

    if (onSubmit) {
      onSubmit(inputText, event);
      return;
    }

    alert(`입력한 내용 : ${inputText}`);
  };

  const controlledInputProps =
    value === undefined
      ? {}
      : {
          value,
        };

  return (
    <form className={className} role="search" onSubmit={handleSubmit}>
      <InputBar
        {...inputProps}
        {...controlledInputProps}
        height="md"
        width={width}
        placeholder={placeholder}
        name={name}
        aria-label={ariaLabel}
        onChange={onChange}
        rightElement={
          <InputIconButton icon="search" ariaLabel="검색" type="submit" />
        }
      />
    </form>
  );
}

export default SearchBar;
