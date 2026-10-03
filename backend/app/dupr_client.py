import os
import base64
import time
import json
import logging
from typing import Optional, Dict, Any
import requests

logger = logging.getLogger("dupr_client")

class DuprClient:
    """
    Official DUPR API integration client.
    Supports both:
    1. DUPR Partner API: Bearer token via base64(ClientKey:ClientSecret) to POST /api/auth/v1.0/token
    2. DUPR User API: Direct login via POST /auth/v1.0/login/
    3. Direct Bearer Token
    """

    def __init__(self):
        self.base_url = os.environ.get("DUPR_BASE_URL", "https://api.dupr.com").rstrip("/")
        self.client_key = os.environ.get("DUPR_CLIENT_KEY", "")
        self.client_secret = os.environ.get("DUPR_CLIENT_SECRET", "")
        self.user_email = os.environ.get("DUPR_EMAIL", "")
        self.user_password = os.environ.get("DUPR_PASSWORD", "")
        
        self.access_token: Optional[str] = os.environ.get("DUPR_BEARER_TOKEN", None)
        self.token_expiry: float = 0
        self.auth_type: str = "none"

        # Auto-login on initialization if environment credentials exist
        if self.access_token:
            self.auth_type = "bearer_token"
            self.token_expiry = time.time() + 86400  # 24h default for explicit token
        elif self.client_key and self.client_secret:
            self.login_partner(self.client_key, self.client_secret)
        elif self.user_email and self.user_password:
            self.login_user(self.user_email, self.user_password)

    def is_authenticated(self) -> bool:
        if not self.access_token:
            return False
        # Token still valid (with 60-second grace window)
        return time.time() < (self.token_expiry - 60)

    def login_partner(self, client_key: str, client_secret: str) -> Dict[str, Any]:
        """Authenticates using DUPR Partner API credentials."""
        self.client_key = client_key.strip()
        self.client_secret = client_secret.strip()
        
        raw_creds = f"{self.client_key}:{self.client_secret}".encode("utf-8")
        encoded = base64.b64encode(raw_creds).decode("utf-8")
        
        url = f"{self.base_url}/api/auth/v1.0/token"
        headers = {
            "x-authorization": encoded,
            "User-Agent": "PickleballPro/1.0",
        }
        
        try:
            res = requests.post(url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                token = data.get("result", {}).get("token")
                if token:
                    self.access_token = token
                    self.token_expiry = time.time() + 3500  # 1 hour validity minus grace
                    self.auth_type = "partner_api"
                    logger.info("DUPR Partner API authentication successful")
                    return {"status": "SUCCESS", "message": "Authenticated with DUPR Partner API"}
                return {"status": "FAILURE", "message": "Token missing in response"}
            else:
                msg = res.json().get("message", res.text) if res.text.startswith("{") else f"HTTP {res.status_code}"
                return {"status": "FAILURE", "message": msg}
        except Exception as e:
            logger.error(f"DUPR Partner login error: {e}")
            return {"status": "ERROR", "message": str(e)}

    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticates using DUPR user account email and password."""
        self.user_email = email.strip()
        self.user_password = password.strip()
        
        url = f"{self.base_url}/auth/v1.0/login/"
        payload = {"email": self.user_email, "password": self.user_password}
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "PickleballPro/1.0",
        }
        
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                token = data.get("result", {}).get("accessToken")
                if token:
                    self.access_token = token
                    self.token_expiry = time.time() + 3500
                    self.auth_type = "user_account"
                    logger.info("DUPR User Account login successful")
                    return {"status": "SUCCESS", "message": "Successfully connected to DUPR Account"}
                return {"status": "FAILURE", "message": "Access token not found in response"}
            else:
                msg = res.json().get("message", res.text) if res.text.startswith("{") else f"HTTP {res.status_code}"
                return {"status": "FAILURE", "message": msg}
        except Exception as e:
            logger.error(f"DUPR User login error: {e}")
            return {"status": "ERROR", "message": str(e)}

    def set_bearer_token(self, token: str) -> Dict[str, Any]:
        """Sets a direct Bearer JWT token."""
        self.access_token = token.strip()
        self.token_expiry = time.time() + 86400
        self.auth_type = "bearer_token"
        return {"status": "SUCCESS", "message": "DUPR Bearer token configured"}

    def get_auth_status(self) -> Dict[str, Any]:
        return {
            "connected": self.is_authenticated(),
            "auth_type": self.auth_type,
            "has_credentials": bool(self.access_token or (self.client_key and self.client_secret) or (self.user_email and self.user_password)),
        }

    def _ensure_authenticated(self) -> bool:
        if self.is_authenticated():
            return True
        if self.client_key and self.client_secret:
            res = self.login_partner(self.client_key, self.client_secret)
            return res.get("status") == "SUCCESS"
        if self.user_email and self.user_password:
            res = self.login_user(self.user_email, self.user_password)
            return res.get("status") == "SUCCESS"
        return False

    def lookup_player_by_id(self, dupr_id: str) -> Dict[str, Any]:
        """
        Queries DUPR API for the official player profile and ratings by DUPR ID.
        Returns parsed official ratings: doubles, singles, and verification status.
        """
        clean_id = dupr_id.strip().upper()
        if not clean_id:
            return {
                "status": "INVALID_ID",
                "verified": False,
                "message": "Empty DUPR ID provided",
            }

        # Check authentication
        if not self._ensure_authenticated():
            return {
                "status": "AUTH_REQUIRED",
                "dupr_id": clean_id,
                "verified": False,
                "source": "unconnected",
                "message": "DUPR account connection required to fetch live official ratings. Please enter your DUPR credentials or API key in Settings.",
            }

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "User-Agent": "PickleballPro/1.0",
        }

        # Try Partner API endpoint: GET /api/user/v1.0/{id}
        try:
            partner_url = f"{self.base_url}/api/user/v1.0/{clean_id}"
            res = requests.get(partner_url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                result = data.get("result", {})
                return self._format_player_result(clean_id, result)
        except Exception as e:
            logger.debug(f"Partner endpoint lookup error: {e}")

        # Try Web/User API flow: POST /player/search/byDuprId -> GET /player/v1.0/{userId}
        try:
            search_url = f"{self.base_url}/player/search/byDuprId"
            res = requests.post(search_url, json={"duprId": clean_id}, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                if results and len(results) > 0:
                    user_id = results[0].get("userId") or results[0].get("id")
                    if user_id:
                        player_url = f"{self.base_url}/player/v1.0/{user_id}"
                        p_res = requests.get(player_url, headers=headers, timeout=10)
                        if p_res.status_code == 200:
                            p_data = p_res.json()
                            return self._format_player_result(clean_id, p_data.get("result", {}))
                    # Fallback to result data directly if contained in search
                    return self._format_player_result(clean_id, results[0])
            elif res.status_code == 404:
                return {
                    "status": "NOT_FOUND",
                    "dupr_id": clean_id,
                    "verified": False,
                    "message": f"DUPR ID '{clean_id}' was not found in DUPR directory.",
                }
        except Exception as e:
            logger.debug(f"User search endpoint lookup error: {e}")

        # Fallback to direct search: POST /player/v1.0/search
        try:
            search_all_url = f"{self.base_url}/player/v1.0/search"
            payload = {"query": clean_id, "limit": 1}
            res = requests.post(search_all_url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                hits = data.get("result", {}).get("hits", [])
                if hits:
                    return self._format_player_result(clean_id, hits[0])
        except Exception as e:
            logger.debug(f"Search all lookup error: {e}")

        return {
            "status": "NOT_FOUND",
            "dupr_id": clean_id,
            "verified": False,
            "message": f"Could not find player with DUPR ID '{clean_id}'. Please check the ID.",
        }

    def _format_player_result(self, dupr_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts and parses verified doubles and singles ratings from DUPR payload."""
        full_name = data.get("fullName") or data.get("name") or data.get("duprId") or dupr_id
        
        # Parse Doubles Rating
        doubles_raw = data.get("doublesRating") if data.get("doublesRating") is not None else data.get("doubles")
        doubles_val: Optional[float] = None
        if doubles_raw is not None and str(doubles_raw).upper() != "NR":
            try:
                doubles_val = round(float(doubles_raw), 2)
            except (ValueError, TypeError):
                doubles_val = None

        # Parse Singles Rating
        singles_raw = data.get("singlesRating") if data.get("singlesRating") is not None else data.get("singles")
        singles_val: Optional[float] = None
        if singles_raw is not None and str(singles_raw).upper() != "NR":
            try:
                singles_val = round(float(singles_raw), 2)
            except (ValueError, TypeError):
                singles_val = None

        doubles_prov = bool(data.get("doublesProvisional", False))
        singles_prov = bool(data.get("singlesProvisional", False))

        return {
            "status": "SUCCESS",
            "dupr_id": data.get("duprId") or dupr_id,
            "name": full_name,
            "doubles_rating": doubles_val,
            "singles_rating": singles_val,
            "doubles_provisional": doubles_prov,
            "singles_provisional": singles_prov,
            "verified": True,
            "source": "dupr_api",
        }

# Global singleton instance
dupr_service = DuprClient()
