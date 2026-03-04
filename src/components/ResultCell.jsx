/**
 * Renders a cell with result, unit, and reference range
 */
export function ResultCell({ value, hideUnit, hideReference }) {
  if (!value || !value.result) {
    return <span className="text-gray-300">-</span>;
  }

  return (
    <div className={`flex flex-col items-center ${
      hideUnit && hideReference ? 'min-h-[38px] justify-center' : ''
    }`}>
      <span className="inline-flex items-center">
        <span className="font-semibold text-gray-900 text-[15px]">{value.result}</span>
        {!hideUnit && !hideReference && value.unit && (
          <span className="text-[11px] text-gray-400 ml-1">{value.unit}</span>
        )}
      </span>
      {!hideReference && value.reference && (
        <span className="text-xs text-gray-400 mt-1">{value.reference}</span>
      )}
      {hideReference && !hideUnit && value.unit && (
        <span className="text-xs text-gray-400 mt-1">{value.unit}</span>
      )}
    </div>
  );
}
