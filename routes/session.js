export function newx(req, res) {
  res.send({ user: req.user });
}

export function create(req, res) {
  res.redirect('/');
}

export function destroy(req, res) {
  req.logout();
  res.redirect('/');
}
