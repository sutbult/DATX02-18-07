module Browse.Bids.Types exposing (..)

import Bid.Types exposing (Bid)

type alias Model =
    { bids : List Bid
    , modal : Maybe Bid
    , processing : Bool
    , sseID : Int
    }

type Msg
    = SetBids (List Bid)
    | DisplayModal Bid
    | CancelModal
    | AcceptBid Bid
    | EndProcessingBid
    | GetSSEId Int
    | Noop
