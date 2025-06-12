
interface DataPreviewProps {
  data: any[];
}

export const DataPreview = ({ data }: DataPreviewProps) => {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Vista Previa (primeras 5 filas)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0]).slice(0, 6).map((key) => (
                <th key={key} className="px-4 py-2 text-left text-sm font-medium border-b">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).slice(0, 6).map((value: any, i) => (
                  <td key={i} className="px-4 py-2 text-sm border-b">
                    {value?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
