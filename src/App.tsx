import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import { load_model } from "./model"; // Importing the load_model function
import "./App.css";

function App() {
  // State to hold the model
  const [model, setModel] = React.useState<tf.GraphModel | null>(null);
  // State to hold the number of days input by the user
  const [numberOfDays, setNumberOfDays] = React.useState<number | "">("");
  // State to hold the prediction result
  const [predictionResult, setPredictionResult] = React.useState<any>(null);
  // State to handle the loading status of the model.
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  // State to handle the error message.
  const [error, setError] = React.useState<string | null>(null);

  // Effect hook to load the model when the component mounts
  React.useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const loadedModel = await load_model(); // Using the imported load_model function
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
    if (model && numberOfDays !== "") {
      try {
        const oneDimension = [0, 0, 0, 0, 0, 0]; // one array of 6 zeros
        const twoDimension = new Array(20)
          .fill(null)
          .map(() => [...oneDimension]); // 20 arrays of 6 zeros
        const inputArray = [twoDimension]; // wrapped inside another array to make it 3D

        const inputTensor = tf.tensor3d(inputArray); // Creating 3D tensor

        // Use model.executeAsync() instead of model.predict()
        const outputTensor = (await model.executeAsync(
          inputTensor
        )) as tf.Tensor;

        // Getting the data from the output tensor
        const data = await outputTensor.data();
        setPredictionResult(String(data[0]));
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
        <label>
          Number of days:
          <input
            type="number"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(Number(e.target.value))}
          />
        </label>
        <button
          onClick={handlePredict}
          disabled={isLoading || model === null || numberOfDays === ""}
        >
          Predict
        </button>
      </div>
      {predictionResult && (
        <div>
          <h2>Prediction Result:</h2>
          <p>{predictionResult}</p>
        </div>
      )}
    </div>
  );
}

export default App;
