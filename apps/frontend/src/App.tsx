import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Register } from "./pages/Register"
import ProtectedRouter from "./middleware/ProtectedRouter";
import { DocumentEditor } from "./pages/DocumentEditor";
import { Home } from "./pages/Home";

const App = ()=>{
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:roomId" element={<Register />} />
        <Route path="/" element = {<Home/>}/>
        <Route path="/start" element={<Register />} />
        <Route path="/doc/:roomId" element = {<ProtectedRouter><DocumentEditor/></ProtectedRouter>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
