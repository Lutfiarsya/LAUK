import { heightResponsive, widthResponsive } from "../helper"
import { Icon } from "@iconify/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiScanIcon } from "@hugeicons/core-free-icons";
import { useLocation, useNavigate } from "react-router";

export const BottomBar = ({}) => {
    const navigate = useNavigate()
    const locationPath = useLocation()


    return(
        <div 
        style={{
        height: heightResponsive(100),
        maxHeight: "100%",
      }}
        className="w-full font-['Poppins'] flex flex-row items-center justify-center gap-8 bg-white shadow-[0px_2px_10px_-2px_black] rounded-t-2xl fixed bottom-0">
            {/* two left */}
            <div
            onClick={() => navigate('/')} 
            style={{
            height: heightResponsive(65),
            width: widthResponsive(40),
            maxWidth: "100%",
            maxHeight: '100%'
            }}
            className={`flex flex-col items-center justify-center gap-1`}>
                <Icon icon={'akar-icons:home-alt1'} color={locationPath.pathname == '/' ? 'var(--Primary-color)' : 'black'} fontSize={32} />
                <h2 className={`${locationPath.pathname == '/' ? 'text-[var(--Primary-color)]' : 'text-black'} text-xs`}>Home</h2>
            </div>

            <div
            onClick={() => navigate('/insight')} 
            style={{
            height: heightResponsive(65),
            width: widthResponsive(40),
            maxWidth: "100%",
            maxHeight: '100%'
            }}
            className="flex flex-col items-center justify-center gap-1">
                <Icon icon={'andrsrxn:chart-combined'} color={locationPath.pathname == '/insight' ? 'var(--Primary-color)' : 'black'} fontSize={32} />
                <h2 className={`${locationPath.pathname == '/insight' ? 'text-[var(--Primary-color)]' : 'text-black'} text-xs`}>Insight</h2>
            </div>

            {/* scan button */}
            <button
            onClick={() => navigate('/scan')} 
            className="bg-linear-to-br flex items-center justify-center shadow-[0px_2px_10px_-4px_black] from-[var(--Primary-color)] to-[var(--Third-color)] rounded-full w-[75px] h-[75px]" 
            >
                <Icon color="white" icon={'boxicons:scan'} fontSize={40} />
            </button>


            <div
            onClick={() => navigate('/ai-consultant')} 
            style={{
            height: heightResponsive(65),
            width: widthResponsive(40),
            maxWidth: "100%",
            maxHeight: '100%'
            }}
            className="flex flex-col items-center text-center justify-center gap-1">
                <HugeiconsIcon color={locationPath.pathname == '/ai-consultant' ? 'var(--Primary-color)' : 'black'} icon={AiScanIcon} size={32} />
                <h2 className={`${locationPath.pathname == '/ai-consultant' ? 'text-[var(--Primary-color)]' : 'text-black'} text-xs`}>AI</h2>
            </div>

            <div
            onClick={() => navigate('/profile')} 
            style={{
            height: heightResponsive(65),
            width: widthResponsive(40),
            maxWidth: "100%",
            maxHeight: '100%'
            }}
            className="flex flex-col items-center justify-center gap-1">
                <Icon color={locationPath.pathname == '/profile' ? 'var(--Primary-color)' : 'black'} icon={'iconamoon:profile-light'} fontSize={32} />
                <h2 className={`${locationPath.pathname == '/profile' ? 'text-[var(--Primary-color)]' : 'text-black'} text-xs`}>Profile</h2>
            </div>
        </div>
    )
}