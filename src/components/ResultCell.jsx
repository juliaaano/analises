/**
 * Renders a cell with result, unit, and reference range
 */
export function ResultCell({ value }) {
  if (!value || !value.result) {
    return <span className="text-gray-300">-</span>;
  }

  return (
    <div className="flex flex-col items-center">
      <span className="font-semibold text-gray-900">{value.result}</span>
      {value.unit && (
        <span className="text-xs text-gray-500">{value.unit}</span>
      )}
      {value.reference && (
        <span className="text-xs text-gray-400">{value.reference}</span>
      )}
    </div>
  );
}
