export default function Test() {
  return (
    <div>
      <button
        onClick={() => {
          throw new Error("BOOM");
        }}
      >
        Test
      </button>
    </div>
  );
}
