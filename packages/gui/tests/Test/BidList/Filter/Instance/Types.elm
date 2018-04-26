module Test.BidList.Filter.Instance.Types exposing (suite)

import Test exposing (..)
import Expect
import Dict

import BidList.Filter.Instance.Types exposing (..)

suite =
    describe "BidList.Filter.Instance.Types" <|
        [ describe "getFilter"
            [ test "Correctly filters currencies" <|
                \() ->
                    let
                        model =
                            { from =
                                { title = "From"
                                , query = ""
                                , elements =
                                    Dict.fromList
                                        [ ("Bitcoin", False)
                                        , ("Ethereum", True)
                                        ]
                                }
                            , to =
                                { title = "To"
                                , query = ""
                                , elements =
                                    Dict.fromList
                                        [ ("Bitcoin", True)
                                        , ("Ethereum", False)
                                        ]
                                }
                            }
                    in
                        Expect.equal
                            (getFilter model)
                            (Filter ["Ethereum"] ["Bitcoin"])
            ]
        ]
