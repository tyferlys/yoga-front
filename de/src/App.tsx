import { useCallback, useState } from "react";
import "./App.css";

import axios, { AxiosError, AxiosResponse } from "axios";

export const $api = axios.create({
  baseURL: "http://94.228.123.176:8000/",
});
export interface IUseSendNumbersReturnValue {
  isLoading?: boolean;
  error?: string;
  response?: AxiosResponse;
}

export interface IAxiosResponseNumbers {
  answer_russian: string;
  answer_english: string;
}

export const useSendPhotoToNetwork = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] =
    useState<AxiosResponse<IAxiosResponseNumbers> | null>(null);
  // eslint-ignore
  const reader = new FileReader();
  const sendPhoto = async (image?: string) => {
    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const response = await $api.post("/network/predict", { image });
      setResponse(response);
    } catch (error) {
      setError((error as AxiosError).message);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    response,
    sendPhoto,
  };
};

function App() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const { response, error, isLoading, sendPhoto } = useSendPhotoToNetwork();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = useCallback(() => {
    sendPhoto(selectedImage);
  }, [sendPhoto, selectedImage]);

  return (
    <div className={""}>
      <h1>YOGA Распознавание объектов на изображении</h1>
      <div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button disabled={isLoading || !selectedImage} onClick={onSubmit}>
          {isLoading ? "Загрузка..." : "Отправить фото"}
        </button>
        <span>{error && error.toString()}</span>
      </div>
      <div>
        {response &&
          (response.data.answer_english.length ||
            response.data.answer_russian.length > 0) && (
            <div>
              <h2>Распознано на изображении</h2>
              На англ: {response?.data.answer_english} <br />
              На русском: {response?.data.answer_russian}
            </div>
          )}
        {selectedImage && (
          <div>
            <h2>Загруженное фото</h2>
            <img src={selectedImage} alt="Uploaded" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
