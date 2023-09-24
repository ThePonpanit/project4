import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import { load_model } from "./model";
import "./App.css";

interface PredictionResult {
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

  const handlePredict = async () => {
    if (model) {
      try {
        let inputArray: number[][] = [[0, 0, 0, 0, 0, 0]]; // Or use the last predicted value

        const twoDimension: number[][][] = [
          new Array(20).fill(null).map(() => inputArray[0]),
        ]; // Adjusted to shape [1,20,6]

        const inputTensor = tf.tensor3d(
          twoDimension,
          [1, 20, 6], // Adjusted to match the shape of twoDimension
          "float32"
        );

        const outputTensor = (await model.executeAsync(
          inputTensor
        )) as tf.Tensor;
        const data: number[][] = (await outputTensor.array()) as number[][];

        setPredictionResult({
          open: data[0][0],
          high: data[0][1],
          low: data[0][2],
          close: data[0][3],
          volume: data[0][4],
        });

        inputArray = [data[0]]; // Save the last predicted value
      } catch (error) {
        console.error("Failed to make a prediction", error);
        setError("Failed to make a prediction");
      }
    }
  };

  return (
    <div className="App">
      <h1>Bitcoin Price Prediction</h1>
      {isLoading && <p>Loading model...</p>}
      {error && <p>{error}</p>}
      <div>
        <button onClick={handlePredict} disabled={isLoading || model === null}>
          Predict Next Day
        </button>
      </div>
      {predictionResult && (
        <div>
          <h2>Prediction Result:</h2>
          <p>
            Open: {predictionResult.open}, High: {predictionResult.high}, Low:{" "}
            {predictionResult.low}, Close: {predictionResult.close}, Volume:{" "}
            {predictionResult.volume}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
