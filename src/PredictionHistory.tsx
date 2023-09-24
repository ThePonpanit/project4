interface PredictionHistoryProps {
  history: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

function PredictionHistory({ history }: PredictionHistoryProps) {
  return (
    <div className="prediction-history">
      <h2>Prediction History</h2>
      {history.length === 0 ? (
        <div className="no-history">
          <p style={{ color: "grey" }}>No Prediction History</p>
        </div>
      ) : (
        <ul>
          {history.map((prediction, index) => (
            <li
              key={index}
              className={index === history.length - 1 ? "latest-date" : ""}
            >
              <p>Date: {prediction.date}</p>
              <p>Open: {prediction.open.toFixed(4)}</p>
              <p>High: {prediction.high.toFixed(4)}</p>
              <p>Low: {prediction.low.toFixed(4)}</p>
              <p>Close: {prediction.close.toFixed(4)}</p>
              <p>Volume: {prediction.volume.toFixed(4)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PredictionHistory;
