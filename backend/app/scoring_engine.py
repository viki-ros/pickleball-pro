import json
from datetime import datetime
from typing import Dict, Any, Optional

def get_state_snapshot(match) -> Dict[str, Any]:
    """Captures the full state of the match for undo history."""
    return {
        "score_team1": match.score_team1,
        "score_team2": match.score_team2,
        "serving_team": match.serving_team,
        "server_number": match.server_number,
        "team1_player1_side": match.team1_player1_side,
        "team1_player2_side": match.team1_player2_side,
        "team2_player1_side": match.team2_player1_side,
        "team2_player2_side": match.team2_player2_side,
        "is_completed": match.is_completed,
        "winner_team": match.winner_team,
    }

def restore_state_snapshot(match, state: Dict[str, Any]):
    """Restores the match state from a snapshot."""
    match.score_team1 = state["score_team1"]
    match.score_team2 = state["score_team2"]
    match.serving_team = state["serving_team"]
    match.server_number = state["server_number"]
    match.team1_player1_side = state["team1_player1_side"]
    match.team1_player2_side = state["team1_player2_side"]
    match.team2_player1_side = state["team2_player1_side"]
    match.team2_player2_side = state["team2_player2_side"]
    match.is_completed = state["is_completed"]
    match.winner_team = state["winner_team"]
    if not match.is_completed:
        match.finished_at = None

def check_win_condition(match) -> bool:
    """Checks if either team has satisfied target points and win-by criteria."""
    s1, s2 = match.score_team1, match.score_team2
    target = match.target_points
    win_by = match.win_by

    if s1 >= target and (s1 - s2) >= win_by:
        match.is_completed = True
        match.winner_team = 1
        match.finished_at = datetime.utcnow()
        return True
    elif s2 >= target and (s2 - s1) >= win_by:
        match.is_completed = True
        match.winner_team = 2
        match.finished_at = datetime.utcnow()
        return True
    return False

def switch_team_sides(match, team: int):
    """Switches the right/left positions of the two players on a team."""
    if team == 1:
        match.team1_player1_side = "left" if match.team1_player1_side == "right" else "right"
        match.team1_player2_side = "right" if match.team1_player2_side == "left" else "left"
    else:
        match.team2_player1_side = "left" if match.team2_player1_side == "right" else "right"
        match.team2_player2_side = "right" if match.team2_player2_side == "left" else "left"

def process_rally(match, winning_team: int) -> Dict[str, Any]:
    """Processes a rally won by winning_team (1 or 2).
    
    Supports:
    - Standard Pickleball Side-Out scoring (Doubles & Singles with 0-0-2 start)
    - Modern Rally scoring
    """
    if match.is_completed:
        return {"error": "Match is already completed"}

    # 1. Save snapshot to history
    history = json.loads(match.history or "[]")
    history.append(get_state_snapshot(match))
    match.history = json.dumps(history)

    is_serving_team = (winning_team == match.serving_team)
    mode = match.scoring_mode.lower()
    m_type = match.match_type.lower()

    if mode == "sideout":
        if is_serving_team:
            # Serving team scored!
            if match.serving_team == 1:
                match.score_team1 += 1
            else:
                match.score_team2 += 1

            # Serving team players switch sides
            if m_type == "doubles":
                switch_team_sides(match, match.serving_team)
            else:
                # In singles, side is based on score parity: even -> right, odd -> left
                score = match.score_team1 if match.serving_team == 1 else match.score_team2
                side = "right" if (score % 2 == 0) else "left"
                if match.serving_team == 1:
                    match.team1_player1_side = side
                else:
                    match.team2_player1_side = side

            # Check win
            check_win_condition(match)

        else:
            # Fault on serving team! Receiving team wins rally
            if m_type == "doubles":
                if match.server_number == 1:
                    # Move to Server 2 on the same team
                    match.server_number = 2
                else:
                    # Side-Out! Serve passes to the other team
                    match.serving_team = 2 if match.serving_team == 1 else 1
                    match.server_number = 1
            else:
                # Singles Side-Out
                match.serving_team = 2 if match.serving_team == 1 else 1
                match.server_number = 1
                # Opponent starts serving from side according to their score
                opp_score = match.score_team1 if match.serving_team == 1 else match.score_team2
                side = "right" if (opp_score % 2 == 0) else "left"
                if match.serving_team == 1:
                    match.team1_player1_side = side
                else:
                    match.team2_player1_side = side

    elif mode == "rally":
        # Point awarded on EVERY rally
        if winning_team == 1:
            match.score_team1 += 1
        else:
            match.score_team2 += 1

        if is_serving_team:
            # Serving team holds serve and switches sides
            if m_type == "doubles":
                switch_team_sides(match, match.serving_team)
            else:
                score = match.score_team1 if match.serving_team == 1 else match.score_team2
                side = "right" if (score % 2 == 0) else "left"
                if match.serving_team == 1:
                    match.team1_player1_side = side
                else:
                    match.team2_player1_side = side
        else:
            # Receiving team won point AND serve
            match.serving_team = winning_team
            match.server_number = 1
            if m_type == "singles":
                score = match.score_team1 if match.serving_team == 1 else match.score_team2
                side = "right" if (score % 2 == 0) else "left"
                if match.serving_team == 1:
                    match.team1_player1_side = side
                else:
                    match.team2_player1_side = side

        check_win_condition(match)

    return get_state_snapshot(match)

def undo_last_rally(match) -> bool:
    """Reverts to the previous rally state."""
    history = json.loads(match.history or "[]")
    if not history:
        return False
    prev_state = history.pop()
    restore_state_snapshot(match, prev_state)
    match.history = json.dumps(history)
    return True

def get_score_call(match) -> str:
    """Returns official verbal score call string (e.g. '4 - 2 - 1' or '7 - 5')."""
    if match.serving_team == 1:
        server_score = match.score_team1
        receiver_score = match.score_team2
    else:
        server_score = match.score_team2
        receiver_score = match.score_team1

    if match.match_type.lower() == "doubles" and match.scoring_mode.lower() == "sideout":
        return f"{server_score} - {receiver_score} - {match.server_number}"
    return f"{server_score} - {receiver_score}"
