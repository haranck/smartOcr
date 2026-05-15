import { Toaster } from "react-hot-toast";
import { MainPage } from "./Page/MainPage";

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <MainPage />
    </>
  );
};

export default App;