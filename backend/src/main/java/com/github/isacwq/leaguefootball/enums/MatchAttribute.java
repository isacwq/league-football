package com.github.isacwq.leaguefootball.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum MatchAttribute {
  @JsonProperty("shooting")
  SHOOTING,
  @JsonProperty("passing")
  PASSING,
  @JsonProperty("dribbling")
  DRIBBLING,
  @JsonProperty("defending")
  DEFENDING,
}
