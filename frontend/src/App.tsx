import './App.css'
import MainView from './components/MainView'
import GeneExpression from './components/GeneExpression'
import CellTypes from './components/CellTypes'
import GenePathways from './components/GenePathways'
import GeneNetwork from './components/GeneNetwork'
import BiologicalSignificance from './components/BiologicalSignificance'

function App() {
  return (
    <div className="app">
      <header>
        <h1>BioVisLLM</h1>
      </header>
      <div className="dashboard">
        {/* Main View (0,0) -> (66%,66%) */}
        <div className="main-view-container">
          <MainView />
        </div>

        {/* Box 1 (66%,0) -> (100%,33%) */}
        <div className="bottom-box-1">
          <GenePathways />
        </div>

        {/* Box 2 (66%,33%) -> (100%,66%) */}
        <div className="bottom-box-2">
          <GeneNetwork />
        </div>

        {/* Box 3 (0,66%) -> (33%,100%) */}
        <div className="right-box-1">
          <GeneExpression />
        </div>

        {/* Box 4 (33%,66%) -> (66%,100%) */}
        <div className="right-box-2">
          <CellTypes />
        </div>

        {/* Box 5 (66%,66%) -> (100%,100%) */}
        <div className="right-box-3">
          <BiologicalSignificance />
        </div>
      </div>
    </div>
  )
}

export default App
