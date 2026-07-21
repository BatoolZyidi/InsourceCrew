from app.core.security import decode_token, hash_password, verify_password
def test_password_hash_round_trip():
    digest=hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", digest)
def test_access_token_round_trip():
    from datetime import timedelta
    from app.core.security import create_token
    token,_=create_token("test-user", "access", timedelta(minutes=60))
    assert decode_token(token, "access")["sub"] == "test-user"
