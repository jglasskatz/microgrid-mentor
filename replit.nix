{pkgs}: {
  deps = [
    pkgs.libxcrypt
    pkgs.nodejs
    pkgs.nodePackages.typescript-language-server
    pkgs.postgresql
  ];
}
