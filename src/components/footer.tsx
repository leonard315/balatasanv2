export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 text-center md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Balatasan Resort Hub. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Developed by Leonard V. Alindato for ITP314.
        </p>
      </div>
    </footer>
  );
}
