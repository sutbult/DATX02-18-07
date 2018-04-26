module Browse.Accept.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Error.Types

type alias Model =
    { modal : Maybe Bid
    , processing : Bool
    , sseID : Int
    , mousePositions : List (Int, Int)
    }

type Msg
    -- Modal
    = DisplayModal Bid
    | CancelModal

    -- Accept bid
    | AcceptBid Bid
    | EndProcessingBid
    | AcceptFailure Error.Types.Msg

    -- Misc
    | GetSSEId Int
    | MouseMove Int Int
    | TriggerPassword
        (List String)
        (Maybe Msg)
        (Maybe Msg)
        Msg
    | ToError Error.Types.Msg
    | Noop


acceptBidMsg : Bid -> Msg
acceptBidMsg bid =
    TriggerPassword
        [ bid.from.currency
        , bid.to.currency
        ]
        (Just CancelModal)
        (Just <| DisplayModal bid)
        (AcceptBid bid)
