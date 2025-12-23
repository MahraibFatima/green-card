import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSeller from "../components/BestSeller";
import BottomBanner from "../components/BottonBanner";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <Newsletter />
    </div>
  );
}
