import Header from '@/components/layout/Header';

// Quiz section shell: the global terminal nav, so the section reads as
// part of the site instead of a standalone page.
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
