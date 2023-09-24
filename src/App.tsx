import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import { load_model } from "./model";
import "./App.css";
import PredictionHistory from "./PredictionHistory";

interface PredictionResult {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function App() {
  const [model, setModel] = React.useState<tf.GraphModel | null>(null);
  const [predictionResult, setPredictionResult] =
    React.useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // State to hold the history of predictions
  const [predictionHistory, setPredictionHistory] = React.useState<
    PredictionResult[]
  >([]);

  // State for the current date
  const [currentDate, setCurrentDate] = React.useState(new Date(2023, 8, 23)); // Months are zero-based

  // Storing the last predicted value to use as input for the next prediction
  const [lastPredictedValue, setLastPredictedValue] = React.useState<
    number[][]
  >([[0, 0, 0, 0, 0, 0]]);

  React.useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const loadedModel = await load_model();
        setModel(loadedModel);
      } catch (error) {
        console.error("Failed to load the model", error);
        setError("Failed to load the model");
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // const updateDateAndPredict = () => {
  //   setCurrentDate((prevDate) => {
  //     const newDate = new Date(prevDate.setDate(prevDate.getDate() + 1));
  //     handlePredict(newDate);
  //     return newDate;
  //   });
  // };

  const handlePredict = async () => {
    if (model) {
      try {
        let inputArray: number[][] = lastPredictedValue;

        const twoDimension: number[][][] = [
          new Array(20).fill(null).map(() => inputArray[0]),
        ];

        const inputTensor = tf.tensor3d(twoDimension, [1, 20, 6], "float32");

        const outputTensor = (await model.executeAsync(
          inputTensor
        )) as tf.Tensor;
        const data: number[][] = (await outputTensor.array()) as number[][];

        // Use the currentDate for this prediction.
        const predictionDateStr = currentDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        setPredictionResult({
          date: predictionDateStr,
          open: data[0][0],
          high: data[0][1],
          low: data[0][2],
          close: data[0][3],
          volume: data[0][4],
        });

        setPredictionHistory((prevHistory) => [
          ...prevHistory,
          {
            date: predictionDateStr,
            open: data[0][0],
            high: data[0][1],
            low: data[0][2],
            close: data[0][3],
            volume: data[0][4],
          },
        ]);

        // Increment currentDate for the next prediction
        setCurrentDate((prevDate) => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + 1);
          return newDate;
        });

        setLastPredictedValue([data[0]]);
      } catch (error) {
        console.error("Failed to make a prediction", error);
        setError("Failed to make a prediction");
      }
    }
  };

  return (
    <div className="container">
      <div className="App">
        <h1>Bitcoin Price Prediction</h1>
        <div style={{ color: "grey" }}>
          The data was cut off on 22 September, 2023.
        </div>
        {isLoading && <p>Loading model...</p>}
        {error && <p className="error">{error}</p>}
        <div>
          <button
            onClick={handlePredict}
            disabled={isLoading || model === null}
          >
            Predict Next Day
          </button>
        </div>
        {predictionResult && (
          <div className="prediction-result">
            <h2>Prediction Result:</h2>
            <ul>
              <li>Date:{predictionResult.date}</li>
              <li>Open: {predictionResult.open.toFixed(4)}</li>
              <li>High: {predictionResult.high.toFixed(4)}</li>
              <li>Low: {predictionResult.low.toFixed(4)}</li>
              <li>Close: {predictionResult.close.toFixed(4)}</li>
              <li>Volume: {predictionResult.volume.toFixed(4)}</li>
            </ul>
          </div>
        )}
      </div>
      <PredictionHistory history={predictionHistory} />
    </div>
  );
}

export default App;
