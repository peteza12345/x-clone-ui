import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";

export default function BoardLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className='max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl xxl:max-w-screen-xxl mx-auto flex justify-between'>
      <aside className='px-2 xsm:px-4 xxl:px-8'>
        <LeftBar />
      </aside>

      <div className='flex-1 lg:min-w-[600px] border-x-[1px] border-borderGray '>
        {children}
        {modal}
      </div>

      <aside className='hidden lg:flex ml-4 md:ml-8 flex-1'>
        <RightBar />
      </aside>
    </main>
  );
}
