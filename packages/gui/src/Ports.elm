port module Ports exposing (..)

-- port for accepting a client id
port getSSEId : (Int -> msg) -> Sub msg

-- port for accessing the response of acceptBid
port acceptBidResponse : (String -> msg) -> Sub msg

port updateBids : (() -> msg) -> Sub msg
