import Logo from "@/assets/icons/logo.foodpass.png";

const LogoComponent = () => (
  <div className="flex flex-col items-center space-y-2 text-center">
    <img src={Logo} alt="Logo" className="w-80 h-80 object-contain" />
    <h1 className="text-2xl font-semibold tracking-tight">Food-Pass</h1>
  </div>
);

export default LogoComponent;
