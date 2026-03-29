import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import Video from './pages/Video';
import Podcast from './pages/Podcast';
import MindMap from './pages/MindMap';
import Lab from './pages/Lab';
import Viva from './pages/Viva';
import UploadPDF from './pages/UploadPDF';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing / Homepage */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* App Pages with Sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/upload" element={<UploadPDF />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/video" element={<Video />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/mindmap" element={<MindMap />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/viva" element={<Viva />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
