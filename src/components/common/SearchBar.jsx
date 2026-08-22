import { InputIconButton } from "./IconButton";
import InputBar from "./Input";

function SearchBar({ width = 360, placeholder = "일단 확인용" }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const inputText = formData.get("inputText");

    alert(`입력한 내용 : ${inputText}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputBar
        height="md"
        width={width}
        placeholder={placeholder}
        name="inputText"
        rightElement={
          <InputIconButton icon="search" ariaLabel="검색" type="submit" />
        }
      />
    </form>
  );
}

export default SearchBar;
