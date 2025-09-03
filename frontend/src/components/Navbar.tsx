import { NavLink } from "react-router-dom";
import "./Navbar.css"; 

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <header className="nav-root">
      <div className="nav-inner">
        <div className="nav-brand">Kinesia Consultorio</div>
        <nav className="nav-links">
          <NavLink to="/" className={linkClass}>Registro</NavLink>
          <NavLink to="/panelprofesional" className={linkClass}>Panel</NavLink>
          <NavLink to="/agenda" className={linkClass}>Agenda</NavLink>
        </nav>
      </div>
    </header>
  );
}

